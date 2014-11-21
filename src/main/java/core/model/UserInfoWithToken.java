package core.model;


public class UserInfoWithToken extends UserInfo {
	private String accessToken;

	public UserInfoWithToken(String name, String emailId, String image) {
		super(name, emailId, image);
	}


	public String getAccessToken() {
		return accessToken;
	}

	public void setAccessToken(String accessToken) {
		this.accessToken = accessToken;
	}

}
