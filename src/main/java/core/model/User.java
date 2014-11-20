package core.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;

public class User {

	public static final String ADMIN = "admin";
	public static final String ADMIN_ID = "admin";

	@Id
	private String id;
	private String emailId;
	private UserInfo userInfo;

	private List<OneLink> outLinks = new ArrayList<OneLink>();
	private List<OneLink> inLinks = new ArrayList<OneLink>();

	public User(UserInfo userInfo) {
		this.userInfo = userInfo;
		this.emailId = userInfo.getEmailId();
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

	public UserInfo getUserInfo() {
		return userInfo;
	}
}
