package core;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;

public class Customer {

	@Id
	private String id;

	private String firstName;
	private String lastName;
	private List<OneLink> links = new ArrayList<OneLink>();

	public Customer() {
	}

	public Customer(String firstName, String lastName) {
		this.firstName = firstName;
		this.lastName = lastName;
	}
	
	public List<OneLink> getLinks() {
		return links;
	}

	@Override
	public String toString() {
		return "Customer [id=" + id + ", firstName=" + firstName + ", lastName=" + lastName + ", links=" + links + "]";
	}

}
