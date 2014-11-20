package core.controller;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

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

	@RequestMapping("/links")
	public List<OneLink> links(@RequestParam(value = "emailId") String emailId) {
		System.out.println("Request:" + emailId);
		User customer = repository.findByEmailId(emailId);
		System.out.println("Result:" + customer);
		if (customer != null) {
			List<OneLink> links = new ArrayList<OneLink>(customer.getOutLinks());
			Collections.reverse(links);
			return links;
		}
		return new ArrayList<OneLink>();
	}

	@RequestMapping("/send")
	public OneLink addLink(@RequestParam(value = "from") String fromEmailId,
			@RequestParam(value = "to") String toEmailId, @RequestParam(value = "title") String title,
			@RequestParam(value = "link") String link) {

		OneLink newLink = new OneLink(title, link, fromEmailId);
		// customer.getOutLinks().add(newLink);
		System.out.println("Link Added -->" + newLink);
		// repository.save(customer);
		return newLink;
	}

	@RequestMapping("/clear")
	public String clearRepo() {
		repository.deleteAll();
		User admin = new User(new UserInfo(User.ADMIN, User.ADMIN, null));
		admin.getOutLinks().add(new OneLink("Google", "http://www.google.com", User.ADMIN));
		repository.save(admin);
		return "Cleared";
	}

	@RequestMapping("/key")
	public String getOAuthKey() {
		return System.getenv("OAUTHIO_PUBLIC_KEY");
	}

}