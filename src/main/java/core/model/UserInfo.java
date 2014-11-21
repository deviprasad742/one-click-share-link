package core.model;


public class UserInfo {
	private String name;
	private String emailId;
	private String image;

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

	public void syncInfo(UserInfo userInfo) {
		setName(userInfo.getName());
		setImage(userInfo.getImage());
	}

}
