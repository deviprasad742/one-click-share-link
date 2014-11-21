package core.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;

public class User {

	private static final int TOKEN_LIMIT = 10;
	private static final int LAST_CONTACT_LIMIT = 10;
	public static final String ADMIN = "admin";
	public static final String ADMIN_ID = "admin";

	@Id
	private String id;
	private String emailId;
	private UserInfo userInfo;
	private int inLinkCounter;

	private List<OneLink> outLinks = new ArrayList<OneLink>();
	private List<OneLink> inLinks = new ArrayList<OneLink>();
	private List<String> accessTokens = new ArrayList<String>();

	private List<String> friends = new ArrayList<String>();
	private List<String> lastContacted = new ArrayList<String>();
	private List<String> favorites = new ArrayList<String>();

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

	public void addToken(String token) {
		accessTokens.add(token);
		if (accessTokens.size() > TOKEN_LIMIT) {
			accessTokens.remove(0);
		}
	}

	public boolean isValidToken(String token) {
		return accessTokens.contains(token);
	}

	public int getInLinkCounter() {
		return inLinkCounter;
	}

	public void incrementInLinkCounter() {
		inLinkCounter++;
	}

	public void clearInLinkCounter() {
		inLinkCounter = 0;
	}

	public List<String> getFriends() {
		return friends;
	}

	public List<String> getFavorites() {
		return favorites;
	}

	public List<String> getLastContacted() {
		return lastContacted;
	}

	public void addToFriends(String emailId) {
		if (!friends.contains(emailId)) {
			friends.add(emailId);
		}
	}

	public void addToFavorites(String emailId) {
		if (!favorites.contains(emailId)) {
			favorites.add(emailId);
		}
	}

	public void addToLastContacted(String emailId) {
		lastContacted.remove(emailId);
		lastContacted.add(emailId);
		if (lastContacted.size() > LAST_CONTACT_LIMIT) {
			lastContacted.remove(0);
		}
	}

}
