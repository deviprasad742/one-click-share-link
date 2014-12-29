package core.controller;

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
        return "main";
    }
    
    @RequestMapping("/" + AffiliateTypeConstants.AMAZON_IN_URL_MAPPING)
    public String amazonAffiliateLink() {
        return AffiliateTypeConstants.AMAZON_IN_URL_MAPPING;
    }
    
    @RequestMapping("/" + AffiliateTypeConstants.FLIPKART_URL_MAPPING)
    public String flipkartAffiliateLink() {
        return AffiliateTypeConstants.FLIPKART_URL_MAPPING;
    }
    

}
