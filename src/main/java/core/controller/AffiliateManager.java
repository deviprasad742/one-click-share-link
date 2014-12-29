package core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import core.UserRepository;
import core.model.OneLink;
import core.model.User;
import core.model.UserInfo;

@RestController
public class AffiliateManager {
	public static final String AMAZON_INDIA = "amazon-india";
//	private static final String BASE_URL = "https://one-click-share-link.herokuapp.com/";
	private static final String BASE_URL = "https://one-click-share-link-dev.herokuapp.com/";

	@Autowired
	private UserRepository repository;
	
	public boolean isAffiliateUser(String emailId) {
		if (isAmazonAffiliateUser(emailId)) {
			return true;
		}
		return false;
	}

	private boolean isAmazonAffiliateUser(String emailId) {
		return AMAZON_INDIA.equals(emailId);
	}
	
	public boolean isAffiliateSupportedUrl(String url) {
		if (isAmazonAffiliateUrl(url)) {
			return true;
		}
		return false;
	}
	
	public boolean isAmazonAffiliateUrl(String url) {
		return url.startsWith("http://www.amazon.in") || url.startsWith("https://www.amazon.in");
	}

	/**
	 * Adds the url to list of recent urls for an Affiliate id
	 * and returns the redirected url
	 * 
	 * @param title
	 * @param url
	 * @return
	 */
	public String addAndGetRedirectUrl(String title, String url, String fromEmailId) {
		if (isAmazonAffiliateUrl(url)) {
			return addAmazonInRedirectUrl(title,url, fromEmailId);
		}
		return url;
	}
	
	private String addAmazonInRedirectUrl(String title, String url, String fromEmailId) {
		String affliateUrl = getAmazonAffiliateUrl(url);

		User user = getAmazonAffiliatedUser();
		addToTrendingLinks(user, title, affliateUrl, fromEmailId);

		String redirectUrl = BASE_URL + AMAZON_INDIA + "?title=%s&link=%s";
		redirectUrl = String.format(redirectUrl, title, affliateUrl);
		return redirectUrl;
	}
	
	/**
	 * Adds the specified link to trending links
	 * 
	 * @param AffiliateUser example amazon-india etc.
	 * @param title
	 * @param AffiliateUrl 
	 */
	private void addToTrendingLinks(User AffiliateUser, String title, String AffiliateUrl, String fromEmailId) {
		OneLink oneLink = new OneLink(title, AffiliateUrl, fromEmailId);
		// use out links to save trending links
		AffiliateUser.addOutLink(oneLink);
		repository.save(AffiliateUser);
	}

	public String getAffiliateUrl(String url) {
		if (isAmazonAffiliateUrl(url)) {
			return getAmazonAffiliateUrl(url);
		}
		return null;
	}

	private String getAmazonAffiliateUrl(String url) {
		return url;
	}

	public User createAffiliatedUser(String emailId) {
		if (isAmazonAffiliateUrl(emailId)) {
			return getAmazonAffiliatedUser();
		}
		return null;
	}
	
	private User getAmazonAffiliatedUser() {
		User user = repository.findByEmailId(AMAZON_INDIA);
		if (user == null) {
			UserInfo userInfo = new UserInfo("Amazon", AMAZON_INDIA,
					"http://icons.iconarchive.com/icons/alecive/flatwoken/512/Apps-Amazon-icon.png");
			user = new User(userInfo);
			repository.save(user);
		}
		return user;
	}
}
