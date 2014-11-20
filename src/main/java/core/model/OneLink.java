package core.model;

import org.springframework.data.annotation.Id;

public class OneLink {

	@Id
	private final String title;
	private final String link;
	private final String emailId;
	private String displayName;

	public OneLink(String title, String link, String emailId) {
		this.title = title;
		this.link = link;
		this.emailId = emailId;
	}

	@Override
	public String toString() {
		return "OneLink [title=" + title + ", link=" + link + ", emailId=" + emailId + "]";
	}

	public String getTitle() {
		return title;
	}

	public String getLink() {
		return link;
	}

	public String getEmailId() {
		return emailId;
	}
	
	public void setDisplayName(String displayName) {
		this.displayName = displayName;
	}
	
	public String getDisplayName() {
		return displayName;
	}

}
