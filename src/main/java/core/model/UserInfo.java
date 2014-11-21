package core.model;

import org.springframework.data.annotation.Transient;

public class UserInfo {
	private String name;
	private String emailId;
	private String image;
	@Transient
	private String accessToken;

	public UserInfo(String name, String emailId, String image) {
		this.name = name;
		this.emailId = emailId;
		this.image = image;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getEmailId() {
		return emailId;
	}

	public void setEmailId(String emailId) {
		this.emailId = emailId;
	}

	public String getImage() {
		return image;
	}

	public void setImage(String image) {
		this.image = image;
	}

	public String getAccessToken() {
		return accessToken;
	}

	public void setAccessToken(String accessToken) {
		this.accessToken = accessToken;
	}

	public void syncInfo(UserInfo userInfo) {
		setName(userInfo.getName());
		setImage(userInfo.getImage());
		setAccessToken(userInfo.getAccessToken());
	}

}
