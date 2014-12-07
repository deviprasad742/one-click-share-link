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

	@RequestMapping("/in-links")
	public List<OneLink> inLinks() {
		User user = getValidatedUser();
		if (user != null) {
			// clear counters
			user.setInLinksSynced(true);
			repository.save(user);

			return getTopInfoLinks(user.getInLinks());
		}
		return new ArrayList<OneLink>();
	}

	@RequestMapping("/out-links")
	public List<OneLink> outLinks() {
		User user = getValidatedUser();
		if (user != null) {
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
			User toUser = repository.findByEmailId(toEmailId);
			OneLink outLink = new OneLink(title, url, toEmailId);

			boolean promptMail = false;
			if (toUser == null || !toUser.isRegistered()) {
				if (isValidEmailAddress(toEmailId)) {
					if (toUser == null) {
						toUser = new User(new UserInfo(toEmailId, toEmailId, ""));
					}
					promptMail =  true;
				} else {
					return INVALID_LINK;
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
			if (controller.canSaveUser(toUser)) {
				OneLink inLink = new OneLink(title, url, fromEmailId);
				toUser.addInLink(inLink);
				toUser.incrementInLinkCounter();
				toUser.setInLinksSynced(false);
				toUser.addToLastContacted(fromEmailId);	
				repository.save(toUser);
				System.out.println("Incoming links updated for user: " + toUser.getEmailId());
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

	@RequestMapping("/delete-link")
	public void deleteLink(@RequestParam(value = "to") String toEmailId, @RequestParam(value = "title") String title,
			@RequestParam(value = "url") String url) {
		User user = getValidatedUser();
		if (user != null) {
			OneLink outLink = findLink(user.getOutLinks(), title, url, toEmailId);
			if (outLink != null) {
				user.getOutLinks().remove(outLink);
				repository.save(user);
			}

			User toUser = repository.findByEmailId(toEmailId);
			if (toUser != null) {
				OneLink inLink = findLink(user.getOutLinks(), title, url, user.getEmailId());
				if (inLink != null) {
					toUser.getInLinks().remove(inLink);

					// remove user if there are no incoming links and is not
					// regestered
					if (toUser.getInLinks().isEmpty() && !toUser.isRegistered()) {
						repository.delete(toUser);
					}
				}
				repository.save(toUser);
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
			repository.save(user);
		}
	}


	@RequestMapping("/key")
	public String getOAuthKey() {
		return System.getenv("OAUTHIO_PUBLIC_KEY");
	}

	private List<OneLink> getTopInfoLinks(List<OneLink> links) {
		List<OneLink> interestedLinks = new ArrayList<OneLink>();
		if (links.size() > LINK_LIMIT) {
			interestedLinks = links.subList(links.size() - LINK_LIMIT, links.size());
		} else {
			interestedLinks = links;
		}

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

	private User getValidatedUser() {
		if (controller.isValidRequest(context)) {
			return controller.getUser(context);
		}
		return null;
	}

	private OneLink findLink(List<OneLink> outLinks, String title, String url, String emailId) {
		for (OneLink oneLink : outLinks) {
			if (oneLink.getTitle().equals(title) && oneLink.getUrl().equals(url)
					&& oneLink.getEmailId().equals(emailId)) {
				return oneLink;
			}
		}
		return null;
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
