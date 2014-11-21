package core.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;

public class OneLink {

	@Id
	private final String title;
	private final String url;
	private final String emailId;
	@Transient
	private String name;

	public OneLink(String title, String url, String emailId) {
		this.title = title;
		this.url = url;
		this.emailId = emailId;
	}

	@Override
	public String toString() {
		return "OneLink [title=" + title + ", url=" + url + ", emailId=" + emailId + "]";
	}

	public String getTitle() {
		return title;
	}

	public String getUrl() {
		return url;
	}

	public String getEmailId() {
		return emailId;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getName() {
		return name;
	}

}
