package core.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;

public class User {

	public static final String ADMIN = "admin";
	public static final String ADMIN_ID = "admin";

	@Id
	private String id;
	private String name;
	private String emailId;
	private String accessToken;
	private String image;

	private List<OneLink> outLinks = new ArrayList<OneLink>();
	private List<OneLink> inLinks = new ArrayList<OneLink>();

	public User() {
	}

	public User(String name, String emailId, String image) {
		this.name = name;
		this.emailId = emailId;
		this.image = image;
	}

	public String getImage() {
		return image;
	}

	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public void setImage(String image) {
		this.image = image;
	}

	public String getEmailId() {
		return emailId;
	}

	public List<OneLink> getInLinks() {
		return inLinks;
	}

	public List<OneLink> getOutLinks() {
		return outLinks;
	}

	public String getAccessToken() {
		return accessToken;
	}

	public void setAccessToken(String accessToken) {
		this.accessToken = accessToken;
	}
	
	public User getUserInfo() {
		User user = new User(name, emailId, image);
		user.setAccessToken(accessToken);
		return user;
	}
	
}
