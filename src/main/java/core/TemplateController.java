package core;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class TemplateController {

    @RequestMapping("/oauth-login")
    public String loginPage() {
        return "login";
    }
    
    @RequestMapping("/")
    public String serverOAuthLogin() {
        return "server-login";
    }

}
