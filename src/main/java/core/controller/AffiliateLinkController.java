package core.controller;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import core.UserRepository;
import core.model.OneLink;
import core.model.User;

@RestController
public class AffiliateLinkController {

	@Autowired
	private UserRepository repository;
	@Autowired
	private AffiliateManager affiliateManager;
	private static final int LINK_LIMIT = 100;

	@RequestMapping("/rec-links")
	public List<OneLink> recommendedLinks(@RequestParam(value = "id") String id) {
		if (affiliateManager.isAffiliateUser(id)) {
			User user = repository.findByEmailId(id);
			if (user != null) {
				return getLinksWithoutEmailId(user.getInLinks());
			}
		}
		return new ArrayList<OneLink>();
	}

	@RequestMapping("/trend-links")
	public List<OneLink> trendingLinks(@RequestParam(value = "id") String id) {
		if (affiliateManager.isAffiliateUser(id)) {
			User user = repository.findByEmailId(id);
			if (user != null) {
				return getLinksWithoutEmailId(user.getOutLinks());
			}
		}
		return new ArrayList<OneLink>();
	}

	private List<OneLink> getLinksWithoutEmailId(List<OneLink> links) {
		List<OneLink> interestedLinks = getTopLinks(links);
		List<OneLink> topPlainLinks = new ArrayList<OneLink>();
		Set<String> duplicateUrls = new HashSet<String>();
		
		for (int i = interestedLinks.size() - 1; i >= 0; i--) {
			OneLink currentLink = interestedLinks.get(i);
			if (duplicateUrls.add(currentLink.getUrl())) {
				topPlainLinks.add(new OneLink(currentLink.getTitle(), currentLink.getUrl(), ""));
			}
		}
		return topPlainLinks;
	}

	private List<OneLink> getTopLinks(List<OneLink> links) {
		return getTopLinks(links, LINK_LIMIT);
	}

	private List<OneLink> getTopLinks(List<OneLink> links, int linkLimit) {
		List<OneLink> interestedLinks = new ArrayList<OneLink>();
		if (links.size() > linkLimit) {
			interestedLinks = links.subList(links.size() - linkLimit, links.size());
		} else {
			interestedLinks = links;
		}
		return interestedLinks;
	}

}
