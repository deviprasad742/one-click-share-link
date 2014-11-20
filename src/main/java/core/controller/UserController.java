package core.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.json.JsonParser;
import com.google.api.client.json.JsonToken;
import com.google.api.client.json.jackson.JacksonFactory;

import core.UserRepository;
import core.model.User;
import core.oauth.GoogleAuthHelper;

@RestController
public class UserController {
	private static final String KEY_PICTURE = "picture";
	private static final String KEY_NAME = "name";
	@Autowired
	private UserRepository repository;
	private GoogleAuthHelper googleAuthHelper = GoogleAuthHelper.getInstance();

	@RequestMapping(value = "/register", method = RequestMethod.POST)
	public User registerUser(@RequestParam(value = "code") String code) {
		GoogleTokenResponse tokenResponse;
		try {
			tokenResponse = googleAuthHelper.getTokenResponse(code);
			User userInfo = createUserInfo(tokenResponse);
			User repoUser = repository.findByEmailId(userInfo.getEmailId());
			if (repoUser == null) {
				repoUser = userInfo;
				System.out.println("New user created: " + userInfo.getEmailId());
			} else {
				repoUser.setName(userInfo.getName());
				repoUser.setImage(userInfo.getImage());
			}
			repoUser.setAccessToken(tokenResponse.getAccessToken());
			repository.save(repoUser);

			return repoUser.getUserInfo();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return null;
	}

	private User createUserInfo(GoogleTokenResponse response) throws IOException {
		String name = null;
		String image = null;
		String emailId = null;
		String userInfoJson = googleAuthHelper.getUserInfoJson(response);
		System.out.println("****User Info: " + userInfoJson);
		JsonParser parser = new JacksonFactory().createJsonParser(userInfoJson);
		JsonToken token = null;
		while ((token = parser.nextToken()) != null) {
			if (token == JsonToken.FIELD_NAME) {
				if (KEY_NAME.equals(parser.getCurrentName())) {
					name = parser.getText();
				} else if (KEY_PICTURE.equals(parser.getCurrentName())) {
					image = parser.getText();
				}
			}
		}
		return new User(name, emailId, image);
	}

	@RequestMapping(value = "/info", method = RequestMethod.GET)
	public User getInfo(@RequestParam(value = "email") String emailId) {
		User user = repository.findByEmailId(emailId);
		return user;
	}

}
