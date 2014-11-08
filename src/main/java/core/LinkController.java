package core;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class LinkController {
	@Autowired
	private CustomerRepository repository;

	@RequestMapping("/links")
	public List<OneLink> links(@RequestParam(value = "name", defaultValue = Customer.ADMIN) String name) {
		System.out.println("Request:" + name);
		Customer customer = repository.findByFirstName(name);
		System.out.println("Result:" + customer);
		if (customer != null) {
			List<OneLink> links = new ArrayList<OneLink>(customer.getLinks());
			Collections.reverse(links);
			return links;
		}
		return new ArrayList<OneLink>();
	}

	@RequestMapping("/add")
	public OneLink addLink(@RequestParam(value = "name", defaultValue = Customer.ADMIN) String name,
			@RequestParam(value = "title") String title, @RequestParam(value = "link") String link) {
		System.out.println("Request:" + name);
		Customer customer = repository.findByFirstName(name);
		System.out.println("Result:" + customer);

		if (customer == null) {
			customer = new Customer(name, name);
			repository.save(customer);
		}

		OneLink newLink = new OneLink(title, link);
		customer.getLinks().add(newLink);
		System.out.println("Link Added -->" + newLink);
		repository.save(customer);
		return newLink;
	}
	
	@RequestMapping("/clear")
	public void clearRepo() {
		repository.deleteAll();
		Customer admin = new Customer(Customer.ADMIN, Customer.ADMIN);
		admin.getLinks().add(new OneLink("Google", "http://www.google.com"));
		repository.save(admin);
	}
	
	@RequestMapping("/key")
	public String getOAuthKey() {
		return System.getenv("OAUTHIO_PUBLIC_KEY");
	}
	
}
