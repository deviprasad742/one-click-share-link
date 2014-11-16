package core;

import java.io.IOException;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import core.oauth.GoogleAuthHelper;

@RestController
public class ServerLoginController {

	private GoogleAuthHelper googleAuthHelper = new GoogleAuthHelper();

	@RequestMapping("/secure")
	public String secureLogin() {
		return googleAuthHelper.buildLoginUrl();
	}

	@RequestMapping(value = "/redirect", method = RequestMethod.GET)
	public ModelAndView redirectMethod() {
		return new ModelAndView("redirect:" + secureLogin());
	}

	@RequestMapping(value = "/info", method = RequestMethod.GET)
	public String getName(@RequestParam(value = "code") String authCode) {
		try {
			String userInfoJson = googleAuthHelper.getUserInfoJson(authCode);
			return userInfoJson;
		} catch (IOException e) {
			e.printStackTrace();
		}
		return "Internal exception";
	}

}
