package core.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.gson.Gson;

import core.UserRepository;
import core.model.User;
import core.model.UserInfo;
import core.model.UserInfoWithToken;
import core.oauth.GoogleAuthHelper;

@RestController
public class UserController {
	private static final String HEADER_ACCESS_TOKEN = "access-token";
	private static final String HEADER_EMAIL_ID = "email-id";
	private static final String KEY_PICTURE = "picture";
	private static final String KEY_NAME = "name";
	private static final String KEY_EMAIL = "email";

	@Autowired
	private UserRepository repository;
	@Autowired
	private HttpServletRequest context;
	private GoogleAuthHelper googleAuthHelper = GoogleAuthHelper.getInstance();

	@RequestMapping(value = "/register", method = RequestMethod.POST)
	public UserInfo registerUser(@RequestParam(value = "code") String code) {
		GoogleTokenResponse tokenResponse;
		try {
			tokenResponse = googleAuthHelper.getTokenResponse(code);
			UserInfoWithToken userInfoWithToken = createUserInfo(tokenResponse);
			User repoUser = repository.findByEmailId(userInfoWithToken.getEmailId());
			if (repoUser == null) {
				repoUser = new User(userInfoWithToken);
				System.out.println("New user created: " + userInfoWithToken.getEmailId());
			} else {
				repoUser.getUserInfo().syncInfo(userInfoWithToken);
			}
			repoUser.addToken(userInfoWithToken.getAccessToken());
			repository.save(repoUser);

			return userInfoWithToken;
		} catch (IOException e) {
			e.printStackTrace();
		}
		return null;
	}
	
	@RequestMapping(value = "/register-token", method = RequestMethod.POST)
	public UserInfo registerUserWithToken(@RequestParam(value = "token") String token) {
		try {
			UserInfoWithToken userInfoWithToken = createUserInfo(token);
			User repoUser = repository.findByEmailId(userInfoWithToken.getEmailId());
			if (repoUser == null) {
				repoUser = new User(userInfoWithToken);
				System.out.println("New user created: " + userInfoWithToken.getEmailId());
			} else {
				repoUser.getUserInfo().syncInfo(userInfoWithToken);
			}
			repoUser.addToken(userInfoWithToken.getAccessToken());
			repository.save(repoUser);

			return userInfoWithToken;
		} catch (IOException e) {
			e.printStackTrace();
		}
		return null;
	}

	private UserInfoWithToken createUserInfo(GoogleTokenResponse response) throws IOException {
		String accessToken = response.getAccessToken();
		return createUserInfo(accessToken);
	}

	@SuppressWarnings("unchecked")
	private UserInfoWithToken createUserInfo(String accessToken) throws IOException {
		String userInfoJson = googleAuthHelper.getUserInfoJsonFromToken(accessToken);
		System.out.println("****User Info: " + userInfoJson);
		String name = null;
		String image = null;
		String emailId = null;
		Gson gson = new Gson();
		Map<String, String> map = new HashMap<String, String>();
		map = (Map<String, String>) gson.fromJson(userInfoJson, map.getClass());

		emailId = map.get(KEY_EMAIL);
		name = map.get(KEY_NAME);
		image = map.get(KEY_PICTURE);

		UserInfoWithToken userInfo = new UserInfoWithToken(name, emailId, image);
		userInfo.setAccessToken(accessToken);
		return userInfo;
	}

	@RequestMapping(value = "/is-valid", method = RequestMethod.GET)
	public boolean isValidRequest() {
		return isValidRequest(context);
	}

	@RequestMapping(value = "/logout", method = RequestMethod.GET)
	public boolean logout() {
		User user = getValidatedUser();
		if (user != null) {
			user.removeToken(getAccessToken(context));
			repository.save(user);
			System.out.println("Logged Out!!!");
			return true;
		} else {
			System.out.println("Valid user not found to logout");
		}
		return false;
	}

	@RequestMapping("/delete")
	public String deleteUser() {
		User user = getValidatedUser();
		if (user != null) {
			repository.delete(user);
			return "Deleted user: " + user.getEmailId();
		}
		return "Not Found!!";
	}

	@RequestMapping(value = "/info", method = RequestMethod.GET)
	public User getInfo() {
		return getValidatedUser();
	}

	public boolean isValidRequest(HttpServletRequest request) {
		String emailId = getEmailId(request);
		String token = getAccessToken(request);
		System.out.println(emailId + "-----" + token);
		if (!StringUtils.isEmpty(token) && !StringUtils.isEmpty(emailId)) {
			User user = repository.findByEmailId(emailId);
			if (user != null) {
				boolean validToken = user.isValidToken(token);
				System.out.println("Token validity:" + validToken);
				return validToken;
			}
		} else {
			System.out.println("Invalid request: " + request.getHeaderNames());
		}
		return false;
	}

	@RequestMapping(value = "/friends", method = RequestMethod.GET)
	public List<UserInfo> getFriends() {
		User user = getValidatedUser();
		if (user != null) {
			List<String> friends = user.getFriends();
			return retrieveInfo(friends);
		}
		return new ArrayList<UserInfo>();
	}

	@RequestMapping(value = "/last-contact", method = RequestMethod.GET)
	public List<UserInfo> getLastContacted() {
		User user = getValidatedUser();
		if (user != null) {
			List<String> lastContacted = new ArrayList<String>(user.getLastContacted());
			Collections.reverse(lastContacted);
			return retrieveInfo(lastContacted);
		}
		return new ArrayList<UserInfo>();
	}

	private List<UserInfo> retrieveInfo(List<String> emailList) {
		List<UserInfo> infoList = new ArrayList<UserInfo>();
		for (String emailId : emailList) {
			User user = repository.findByEmailId(emailId);
			String name = emailId;
			String image = "";
			if (user != null) {
				name = user.getUserInfo().getName();
				image = user.getUserInfo().getImage();
			}
			infoList.add(new UserInfo(name, emailId, image));
		}
		return infoList;
	}

	private String getAccessToken(HttpServletRequest request) {
		return request.getHeader(HEADER_ACCESS_TOKEN);
	}

	private String getEmailId(HttpServletRequest request) {
		return request.getHeader(HEADER_EMAIL_ID);
	}

	public User getUser(HttpServletRequest request) {
		String emailId = getEmailId(request);
		return repository.findByEmailId(emailId);
	}

	private User getValidatedUser() {
		if (isValidRequest(context)) {
			return getUser(context);
		}
		return null;
	}

}
