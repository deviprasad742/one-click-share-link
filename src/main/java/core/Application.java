package core;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;

@ComponentScan
@EnableAutoConfiguration
public class Application implements CommandLineRunner {
	@Autowired
	private CustomerRepository repository;

	public static void main(String[] args) {
		String webPort = System.getenv("PORT");
		if (webPort == null || webPort.isEmpty()) {
			webPort = "8080";
		}
		System.setProperty("server.port", webPort);

		SpringApplication.run(Application.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		//
		repository.deleteAll();

		if (repository.findByFirstName(Customer.ADMIN) == null) {
			Customer admin = new Customer(Customer.ADMIN, Customer.ADMIN);
			admin.getLinks().add(new OneLink("Google", "http://www.google.com"));
			repository.save(admin);
			System.out.println(admin);
		}
	}

	protected void test() {
		repository.deleteAll();

		// save a couple of customers
		Customer customer1 = new Customer("Alice", "Smith");
		customer1.getLinks().add(new OneLink("Link11", "http://www.link1.com"));
		customer1.getLinks().add(new OneLink("Link11", "http://www.link1.com"));
		customer1.getLinks().add(new OneLink("Link12", "http://www.link2.com"));
		customer1.getLinks().add(new OneLink("Link12", "http://www.link2mod.com"));
		repository.save(customer1);
		Customer customer2 = new Customer("Bob", "Smith");
		customer2.getLinks().add(new OneLink("Link21", "http://www.lin1.com"));

		repository.save(customer2);

		// fetch all customers
		System.out.println("Customers found with findAll():");
		System.out.println("-------------------------------");
		for (Customer customer : repository.findAll()) {
			System.out.println(customer);
		}
		System.out.println();

		// fetch an individual customer
		System.out.println("Customer found with findByFirstName('Alice'):");
		System.out.println("--------------------------------");
		System.out.println(repository.findByFirstName("Alice"));

		System.out.println("Customers found with findByLastName('Smith'):");
		System.out.println("--------------------------------");
		for (Customer customer : repository.findByLastName("Smith")) {
			System.out.println(customer);
		}
	}

}
