package core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import core.UserRepository;
import core.model.OneLink;
import core.model.User;
import core.model.UserInfo;

@RestController
public class AffiliateManager {
	private static final String BASE_URL = "https://one-click-share-link.herokuapp.com/";

	@Autowired
	private UserRepository repository;

	public boolean isAffiliateUser(String emailId) {
		for (AffiliateType affiliateType : AffiliateType.values()) {
			if (affiliateType.getEmailId().equals(emailId)) {
				return true;
			}
		}
		return false;
	}

	public boolean isAffiliateSupportedUrl(String url) {
		return getAffliateType(url) != null;
	}
	
	private AffiliateType getAffliateType(String url) {
		for (AffiliateType affiliateType : AffiliateType.values()) {
			if (urlMatches(url, affiliateType.getDomain(), affiliateType.getLocale())) {
				return affiliateType;
			}
		}
		return null;
	}


	private boolean urlMatches(String url, String domain, String locale) {
		String domainLoc = "www." + domain + "." + locale;
		String httpUrl = "http://" + domainLoc;
		String httpsUrl = "https://" + domainLoc;
		return url.startsWith(httpUrl) || url.startsWith(httpsUrl);
	}

	/**
	 * Adds the url to list of recent urls for an Affiliate id and returns the
	 * redirected url
	 * 
	 * @param title
	 * @param url
	 * @return the tag appended url
	 */
	public String addAndGetRedirectUrl(String title, String url, String fromEmailId) {
		AffiliateType affliateType = getAffliateType(url);
		if (affliateType != null) {
			return addRedirectUrl(affliateType, title, url, fromEmailId);
		}
		return url;
	}

	private String addRedirectUrl(AffiliateType affiliateType, String title, String url, String fromEmailId) {
		String affliateUrl = getAffiliateUrl(url, affiliateType);
		User user = getAffiliatedUser(affiliateType);
		addToTrendingLinks(user, title, affliateUrl, fromEmailId);
		
		String redirectUrl = BASE_URL + affiliateType.getUrlMapping() + "?title=%s&link=%s";
		redirectUrl = String.format(redirectUrl, title, affliateUrl);
		
		// currently using the direct url. In future we might use redirect url
		System.out.println("$$$$$$$$$$Affiliate url created: " + affliateUrl);
		return affliateUrl;
	}

	/**
	 * Adds the specified link to trending links
	 * 
	 * @param affiliateUser
	 *            example amazon-india etc.
	 * @param title
	 * @param affiliateUrl
	 */
	private void addToTrendingLinks(User affiliateUser, String title, String affiliateUrl, String fromEmailId) {
		OneLink oneLink = new OneLink(title, affiliateUrl, fromEmailId);
		// use out links to save trending links
		affiliateUser.addOutLink(oneLink);
		repository.save(affiliateUser);
	}

	/**
	 * 
	 * @param url
	 * @return affiliate compatible url if supported else returns null
	 */
	
	public String getAffiliateUrl(String url) {
		AffiliateType affliateType = getAffliateType(url);
		if (affliateType != null) {
			return getAffiliateUrl(url, affliateType);
		}
		return null;
	}
	
	private String getAffiliateUrl(String url, AffiliateType affiliateType) {
		String affliateTag = affiliateType.getAffliateTag();
		if (!url.contains(affliateTag)) {
			if (!url.contains("?")) {
				affliateTag = "?" + affliateTag;
			}
			url = url + affliateTag;
		}
		return url;
	}

	public User createAffiliatedUser(String emailId) {
		if (isAffiliateUser(emailId)) {
			return getAffiliatedUser(emailId);
		}
		return null;
	}
	
	private User getAffiliatedUser(AffiliateType affiliateType) {
		if (affiliateType != null) {
			User user = repository.findByEmailId(affiliateType.getEmailId());
			if (user == null) {
				UserInfo userInfo = new UserInfo(affiliateType.getName(), affiliateType.getEmailId(),
						affiliateType.getImage());
				user = new User(userInfo);
				repository.save(user);
			}
			return user;
		}
		return null;
	}

	private User getAffiliatedUser(String emailId) {
		return getAffiliatedUser(AffiliateType.getByEmailId(emailId));
	}
}
