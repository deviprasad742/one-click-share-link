package core;

import java.util.ArrayList;
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
    public List<OneLink> links(@RequestParam(value="name", defaultValue="Alice") String name) {
    	System.out.println("Request:" + name);
         if (name == null) {
        	 name = "Alice";
         }
        Customer customer = repository.findByFirstName(name);
        System.out.println("Result:" + customer);
        if (customer != null) {
        	return customer.getLinks();
//        	return customer.getLinks().get(0);
        }
        return new ArrayList<OneLink>();
//    	return new OneLink("", "");
    }
}
