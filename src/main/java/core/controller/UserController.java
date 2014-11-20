package core.controller;

import java.io.IOException;
import java.io.StringReader;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.gson.stream.JsonReader;

import core.UserRepository;
import core.model.User;
import core.model.UserInfo;
import core.oauth.GoogleAuthHelper;

@RestController
public class UserController {
	private static final String KEY_PICTURE = "picture";
	private static final String KEY_NAME = "name";
	@Autowired
	private UserRepository repository;
	private GoogleAuthHelper googleAuthHelper = GoogleAuthHelper.getInstance();

	@RequestMapping(value = "/register", method = RequestMethod.POST)
	public UserInfo registerUser(@RequestParam(value = "code") String code) {
		GoogleTokenResponse tokenResponse;
		try {
			tokenResponse = googleAuthHelper.getTokenResponse(code);
			UserInfo userInfo = createUserInfo(tokenResponse);
			User repoUser = repository.findByEmailId(userInfo.getEmailId());
			if (repoUser == null) {
				repoUser = new User(userInfo);
				System.out.println("New user created: " + userInfo.getEmailId());
			} else {
				repoUser.getUserInfo().syncInfo(userInfo);
			}
			repository.save(repoUser);

			return repoUser.getUserInfo();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return null;
	}

	private UserInfo createUserInfo(GoogleTokenResponse response) throws IOException {
		String name = null;
		String image = null;
		String emailId = null;
		String userInfoJson = googleAuthHelper.getUserInfoJson(response);
		System.out.println("****User Info: " + userInfoJson);

		JsonReader reader = new JsonReader(new StringReader(userInfoJson));
		try {
			while (reader.hasNext()) {
				String nextName = reader.nextName();
				if (KEY_NAME.equals(nextName)) {
					name = reader.nextString();
				} else if (KEY_PICTURE.equals(nextName)) {
					image = reader.nextString();
				} else {
					reader.skipValue();
				}
			}
		} finally {
			reader.close();
		}
		UserInfo userInfo = new UserInfo(name, emailId, image);
		userInfo.setAccessToken(response.getAccessToken());
		return userInfo;
	}

	@RequestMapping(value = "/info", method = RequestMethod.GET)
	public User getInfo(@RequestParam(value = "email") String emailId) {
		User user = repository.findByEmailId(emailId);
		return user;
	}

}
