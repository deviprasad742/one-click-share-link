package core.model;

import java.util.LinkedList;
import java.util.List;

import org.springframework.data.annotation.Id;

public class User {

	private static final int MAX_LINK_LIMIT = 100;
	private static final int TOKEN_LIMIT = 10;
	private static final int LAST_CONTACT_LIMIT = 10;
	public static final String ADMIN = "admin";
	public static final String ADMIN_ID = "admin";

	@Id
	private String id;
	private UserInfo userInfo;
	private int inLinkCounter;
	private String emailId;

	private List<OneLink> outLinks = new LinkedList<OneLink>();
	private List<OneLink> inLinks = new LinkedList<OneLink>();
	private List<String> accessTokens = new LinkedList<String>();
	private boolean isInLinksSynced;
	private boolean isInUnreadSynced;
	private boolean isOutUnreadSynced;

	private List<String> friends = new LinkedList<String>();
	private List<String> lastContacted = new LinkedList<String>();
	private List<String> favorites = new LinkedList<String>();

	public User(UserInfo userInfo) {
		this.userInfo = userInfo;
		emailId = userInfo.getEmailId();
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
	
	public boolean isRegistered() {
		return accessTokens.size() > 0;
	}

	public void removeToken(String token) {
		accessTokens.remove(token);
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
	
	/**
	 * Check and decrement in link counter
	 */
	public void checkDecrementInLinkCounter() {
		if (inLinkCounter != 0) {
			inLinkCounter--;
		}
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
		System.out.println("Last contact updated" + lastContacted);
	}

	public void addOutLink(OneLink outLink) {
		checkAndAdd(outLinks, outLink);
	}

	public void addInLink(OneLink inLink) {
		checkAndAdd(inLinks, inLink);
	}

	private void checkAndAdd(List<OneLink> links, OneLink link) {
		links.add(link);
		if (links.size() > MAX_LINK_LIMIT) {
			links.remove(0);
		}
	}
	
	public boolean isInLinksSynced() {
		return isInLinksSynced;
	}
	
	public void setInLinksSynced(boolean isInLinksSynced) {
		this.isInLinksSynced = isInLinksSynced;
	}
	
	public boolean isInUnreadSynced() {
		return isInUnreadSynced;
	}
	
	public void setInUnreadSynced(boolean isInUnreadSynced) {
		this.isInUnreadSynced = isInUnreadSynced;
	}
	
	public boolean isOutUnreadSynced() {
		return isOutUnreadSynced;
	}
	
	public void setOutUnreadSynced(boolean isOutUndreadSynced) {
		this.isOutUnreadSynced = isOutUndreadSynced;
	}
	
}
