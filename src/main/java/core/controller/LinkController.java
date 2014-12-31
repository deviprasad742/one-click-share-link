package core.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import core.UserRepository;
import core.model.OneLink;
import core.model.User;
import core.model.UserInfo;

@RestController
public class LinkController {
	private static final String INVALID_STATUS = "invalid";
	private static final int LINK_LIMIT = 50;
	private static final OneLink INVALID_LINK = new OneLink(INVALID_STATUS, INVALID_STATUS, INVALID_STATUS);
	private static final String PROMPT_MAIL_STATUS = "prompt_mail";
	private static final OneLink PROMPT_MAIL_LINK = new OneLink(PROMPT_MAIL_STATUS, PROMPT_MAIL_STATUS, PROMPT_MAIL_STATUS);

	@Autowired
	private UserRepository repository;
	@Autowired
	private UserController controller;
	@Autowired
	private HttpServletRequest context;
	@Autowired
	private AffiliateManager affiliateManager;

	@RequestMapping("/in-links")
	public List<OneLink> inLinks() {
		User user = getValidatedUser();
		if (user != null) {
			// clear counters
			user.setInLinksSynced(true);
			user.setInUnreadSynced(true);
			repository.save(user);

			return getTopInfoLinks(user.getInLinks());
		}
		return new ArrayList<OneLink>();
	}

	@RequestMapping("/out-links")
	public List<OneLink> outLinks() {
		User user = getValidatedUser();
		if (user != null) {
			user.setOutUnreadSynced(true);
			repository.save(user);
			return getTopInfoLinks(user.getOutLinks());
		}
		return new ArrayList<OneLink>();
	}

	@RequestMapping("/send")
	public OneLink addLink(@RequestParam(value = "to") String toEmailId, @RequestParam(value = "title") String title,
			@RequestParam(value = "url") String url) {
		User user = getValidatedUser();
		if (user != null) {
			toEmailId = toEmailId.trim();

			boolean isAffiliateToUser = affiliateManager.isAffiliateUser(toEmailId);
			if (isAffiliateToUser) {
				//if the user sends wrong url ignore it
				url = affiliateManager.getAffiliateUrl(url);
				if (url == null) {
					return INVALID_LINK;
				}
			} else {
				if (affiliateManager.isAffiliateSupportedUrl(url)) {
					url = affiliateManager.addAndGetRedirectUrl(title, url, user.getEmailId());
				}
			}
			
			
			User toUser = repository.findByEmailId(toEmailId);
			OneLink outLink = new OneLink(title, url, toEmailId);

			boolean promptMail = false;
			if (isAffiliateToUser) {
				if (toUser == null) {
					 toUser = affiliateManager.createAffiliatedUser(toEmailId);
				}
			} else {
				if (toUser == null || !toUser.isRegistered()) {
					if (isValidEmailAddress(toEmailId)) {
						if (toUser == null) {
							toUser = new User(new UserInfo(toEmailId, toEmailId, ""));
						}
						promptMail =  true;
					} else {
						return INVALID_LINK;
					}
				} else {
					outLink.setUnread(true);
				}
			}


			// update sent user info
			user.addOutLink(outLink);
			user.addToLastContacted(toEmailId);
			user.addToFriends(toEmailId);
			repository.save(user);

			String fromEmailId = user.getEmailId();
			if (toEmailId.equals(fromEmailId)) {
				toUser = user;
			}

			// update received user info
			if (isAffiliateToUser || controller.canSaveUser(toUser)) {
				addAndSaveLink(title, url, toUser, fromEmailId);
			}
			System.out.println("Link Added -->" + outLink);
			
			if (promptMail) {
				return PROMPT_MAIL_LINK;
			} else {
				return outLink;
			}
		}
		return INVALID_LINK;
	}

	private void addAndSaveLink(String title, String url, User toUser, String fromEmailId) {
		OneLink inLink = new OneLink(title, url, fromEmailId);
		inLink.setUnread(true);
		toUser.addInLink(inLink);
		toUser.incrementInLinkCounter();
		toUser.setInLinksSynced(false);
		toUser.addToLastContacted(fromEmailId);	
		repository.save(toUser);
		System.out.println("Incoming links updated for user: " + toUser.getEmailId());
	}
	
	@RequestMapping("/delete-link")
	public OneLink deleteLink(@RequestParam(value = "to") String toEmailId, @RequestParam(value = "title") String title,
			@RequestParam(value = "url") String url) {
		OneLink outLink = null;
		User user = getValidatedUser();
		if (user != null) {
			outLink = findLinkToDelete(user.getOutLinks(), title, url, toEmailId);
			if (outLink != null) {
				user.getOutLinks().remove(outLink);
				//use unread flag to force re-sync on client
				user.setOutUnreadSynced(false);
				repository.save(user);
			}

			User toUser = repository.findByEmailId(toEmailId);
			String fromEmailId = user.getEmailId();
			if (toEmailId.equals(fromEmailId)) {
				toUser = user;
			}

			if (toUser != null) {
				OneLink inLink = findLinkToDelete(toUser.getInLinks(), title, url, fromEmailId);
				// allow delete of only unread links
				if (inLink != null && inLink.isUnread()) {
					toUser.getInLinks().remove(inLink);
				
					// update the link counter status
					toUser.checkDecrementInLinkCounter();
					
					// use in links flag to force re-sync
					toUser.setInLinksSynced(false);

					// remove user if there are no incoming links and is not
					// registered
					if (toUser.getInLinks().isEmpty() && !toUser.isRegistered()) {
						repository.delete(toUser);
					}
					repository.save(toUser);
				}
			}
		}
		
		return outLink != null ? outLink : INVALID_LINK;
	}
	
	@RequestMapping("/delete-in-link")
	public OneLink deleteInLink(@RequestParam(value = "from") String fromEmailId, @RequestParam(value = "title") String title,
			@RequestParam(value = "url") String url) {
		User user = getValidatedUser();
		if (user != null) {
			OneLink inLink = findLinkToDelete(user.getInLinks(), title, url, fromEmailId);
			if (inLink != null) {
				user.getInLinks().remove(inLink);
				user.setInLinksSynced(false);
				repository.save(user);
				return inLink;
			}
		}
		return INVALID_LINK;
	}
	
	
	@RequestMapping("/mark-read")
	public void markRead(@RequestParam(value = "from") String fromEmailId, @RequestParam(value = "title") String title,
			@RequestParam(value = "url") String url) {
		User user = getValidatedUser();
		if (user != null) {
			List<OneLink> inLinks = findLinks(user.getInLinks(), title, url, fromEmailId);
			for (OneLink oneLink : inLinks) {
				oneLink.setUnread(false);
			}
			user.setInUnreadSynced(false);
			repository.save(user);
			System.out.println("Updated unread status for in-links:" +  inLinks);

			User fromUser = repository.findByEmailId(fromEmailId);
			String emailId = user.getEmailId();
			if (emailId.equals(fromEmailId)) {
				fromUser = user;
			}
			
			if (fromUser != null) {
				List<OneLink> outLinks = findLinks(fromUser.getOutLinks(), title, url, emailId);
				for (OneLink oneLink : outLinks) {
					oneLink.setUnread(false);
				}
				System.out.println("Updated unread status for out-links:" +  outLinks);

				fromUser.setOutUnreadSynced(false);
				repository.save(fromUser);
			}
		}
	}

	@RequestMapping("/has-in-links")
	public boolean hasIncomingLinks() {
		User user = getValidatedUser();
		if (user != null) {
			return !user.isInLinksSynced();
		}
		return false;
	}
	
	@RequestMapping("/has-updates")
	public boolean hasUpdates() {
		User user = getValidatedUser();
		if (user != null) {
			return !(user.isInLinksSynced() && user.isInUnreadSynced() && user.isOutUnreadSynced());
		}
		return false;
	}
	
	@RequestMapping("/has-in-unread-update")
	public boolean hasInUnreadUpdates() {
		User user = getValidatedUser();
		if (user != null) {
			return !user.isInUnreadSynced();
		}
		return false;
	}
	
	@RequestMapping("/badge")
	public String getBadge() {
		String badge = "";
		User user = getValidatedUser();
		if (user != null) {
			if (user.getInLinkCounter() > 0) {
				badge = badge + user.getInLinkCounter();
			}
			
			List<OneLink> topLinks = getTopLinks(user.getOutLinks(), 10);
			int outUnreadCounter = 0;
			for (OneLink oneLink : topLinks) {
				if (oneLink.isUnread()) {
					outUnreadCounter++;
				}
			}
			
			if (outUnreadCounter > 0) {
				if(badge.equals("")) {
					badge = "0";
				}
				badge = badge + "/" + outUnreadCounter;
			}
		}
		return badge;
	}
	
	
	@RequestMapping("/has-out-unread-update")
	public boolean hasOutUnreadUpdates() {
		User user = getValidatedUser();
		if (user != null) {
			return !user.isOutUnreadSynced();
		}
		return false;
	}

	@RequestMapping("/in-links-size")
	public int getIncomingLinksSize() {
		User user = getValidatedUser();
		if (user != null) {
			return user.getInLinkCounter();
		}
		return 0;
	}
	
	@RequestMapping("/clear-in-links")
	public void clearIncomingLinksSize() {
		User user = getValidatedUser();
		if (user != null) {
			user.clearInLinkCounter();
			user.setInLinksSynced(false);
			repository.save(user);
		}
	}


	@RequestMapping("/key")
	public String getOAuthKey() {
		return System.getenv("OAUTHIO_PUBLIC_KEY");
	}

	private List<OneLink> getTopInfoLinks(List<OneLink> links) {
		List<OneLink> interestedLinks = getTopLinks(links);
		Map<String, String> userNameCache = new HashMap<String, String>();

		List<OneLink> topInfoLinks = new ArrayList<OneLink>();

		for (int i = interestedLinks.size() - 1; i >= 0; i--) {
			OneLink currentLink = interestedLinks.get(i);

			String emailId = currentLink.getEmailId();
			String name = userNameCache.get(emailId);
			if (name == null) {
				User user = repository.findByEmailId(emailId);
				if (user == null) {
					name = emailId;
				} else {
					name = user.getUserInfo().getName();
				}
				userNameCache.put(emailId, name);
			}
			currentLink.setName(name);
			topInfoLinks.add(currentLink);
		}
		return topInfoLinks;
	}

	private List<OneLink> getTopLinks(List<OneLink> links) {
		return getTopLinks(links, LINK_LIMIT);
	}

	private List<OneLink> getTopLinks(List<OneLink> links, int linkLimit) {
		List<OneLink> interestedLinks = new ArrayList<OneLink>();
		if (links.size() > linkLimit) {
			interestedLinks = links.subList(links.size() - linkLimit, links.size());
		} else {
			interestedLinks = links;
		}
		return interestedLinks;
	}

	private User getValidatedUser() {
		if (controller.isValidRequest(context)) {
			return controller.getUser(context);
		}
		return null;
	}

	/**
	 * 
	 * @param links
	 * @param title
	 * @param url
	 * @param emailId
	 * @return link with all the matching attributes
	 */
	
	private OneLink findLinkToDelete(List<OneLink> links, String title, String url, String emailId) {
		for (OneLink oneLink : links) {
			if (oneLink.getUrl().equals(url) && oneLink.getTitle().equals(title)
					&& oneLink.getEmailId().equals(emailId)) {
				System.out.println("-----------------Link to be deleted:" + oneLink);
				return oneLink;
			}
		}
		return null;
	}
	
	private List<OneLink> findLinks(List<OneLink> links, String title, String url, String emailId) {
		List<OneLink> foundLinks = new ArrayList<OneLink>();
		for (OneLink oneLink : links) {
			if (oneLink.getUrl().equals(url)
					&& oneLink.getEmailId().equals(emailId)) {
				foundLinks.add(oneLink);
			}
		}
		return foundLinks;
	}

	public static boolean isValidEmailAddress(String emailId) {
		try {
			InternetAddress emailAddr = new InternetAddress(emailId);
			emailAddr.validate();
		} catch (AddressException ex) {
			return false;
		}
		return true;
	}

}
