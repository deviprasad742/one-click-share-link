package core.controller;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

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
			List<OneLink> links = new ArrayList<OneLink>(user.getInLinks());
			Collections.reverse(links);

			// clear counters
			user.clearInLinkCounter();
			repository.save(user);

			return links;
		}
		return new ArrayList<OneLink>();
	}

	@RequestMapping("/out-links")
	public List<OneLink> outLinks() {
		User user = getValidatedUser();
		if (user != null) {
			List<OneLink> links = new ArrayList<OneLink>(user.getOutLinks());
			Collections.reverse(links);
			return links;
		}
		return new ArrayList<OneLink>();
	}

	private User getValidatedUser() {
		if (controller.isValidRequest(context)) {
			return controller.getUser(context);
		}
		return null;
	}

	@RequestMapping("/send")
	public OneLink addLink(@RequestParam(value = "to") String toEmailId, @RequestParam(value = "title") String title,
			@RequestParam(value = "url") String url) {
		User user = getValidatedUser();
		if (user != null) {
			OneLink outLink = new OneLink(title, url, toEmailId);
			user.getOutLinks().add(outLink);
			user.addToLastContacted(toEmailId);
			repository.save(user);

			User toUser = repository.findByEmailId(toEmailId);
			if (toUser == null) {
				sendMail(outLink, toEmailId);
			} else {
				OneLink inLink = new OneLink(title, url, user.getEmailId());
				toUser.getInLinks().add(inLink);
				toUser.incrementInLinkCounter();
				repository.save(toUser);
			}
			System.out.println("Link Added -->" + outLink);
			return outLink;
		}
		return null;
	}

	private void sendMail(OneLink newLink, String toEmailId) {

	}

	@RequestMapping("/delete")
	public void deleteLink(@RequestParam(value = "to") String toEmailId, @RequestParam(value = "title") String title,
			@RequestParam(value = "url") String url) {
		User user = getValidatedUser();
		if (user != null) {
			OneLink outLink = findLink(user.getOutLinks(), title, url, toEmailId);
			if (outLink != null) {
				user.getOutLinks().remove(outLink);
			}

			User toUser = repository.findByEmailId(toEmailId);
			if (toUser != null) {
				OneLink inLink = findLink(user.getOutLinks(), title, url, user.getEmailId());
				if (inLink != null) {
					user.getInLinks().remove(inLink);
				}
			}
		}
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

	@RequestMapping("/clear")
	public String clearRepo() {
		repository.deleteAll();
		User admin = new User(new UserInfo(User.ADMIN, User.ADMIN, null));
		admin.getOutLinks().add(new OneLink("Google", "http://www.google.com", User.ADMIN));
		repository.save(admin);
		return "Cleared";
	}

	public boolean hasIncomingLinks() {
		User user = getValidatedUser();
		if (user != null) {
			return user.getInLinkCounter() > 0;
		}
		return false;
	}

	@RequestMapping("/key")
	public String getOAuthKey() {
		return System.getenv("OAUTHIO_PUBLIC_KEY");
	}

}
