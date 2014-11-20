package core.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import core.oauth.GoogleAuthHelper;

@RestController
public class GoogleOAuthController {

	private GoogleAuthHelper googleAuthHelper = GoogleAuthHelper.getInstance();

	@RequestMapping("/secure")
	public String secureLogin() {
		return googleAuthHelper.buildLoginUrl();
	}

	@RequestMapping(value = "/redirect", method = RequestMethod.GET)
	public ModelAndView redirectMethod() {
		return new ModelAndView("redirect:" + secureLogin());
	}


}
