package core.controller;

public enum AffiliateType {
	
	
AMAZON_IN("amazon-india", "Amazon", AffiliateTypeConstants.AMAZON_IN_IMAGE, AffiliateTypeConstants.AMAZON_IN_URL_MAPPING, "amazon", "in", "&tag=1clishalin-21"),
FLIPKART("flipkart", "Flipkart", AffiliateTypeConstants.FLIPKART_IMAGE, AffiliateTypeConstants.FLIPKART_URL_MAPPING, "flipkart", "com", "&affid=oneclicks")
	;
	
	private final String emailId;
	private final String name;
	private final String image;
	private final String urlMapping;
	private final String domain;
	private final String locale;
	private final String affliateTag;
	
	
	private AffiliateType(String emailId, String name, String image, String urlMapping, String domain, String locale, String affliateTag) {
		this.emailId = emailId;
		this.name = name;
		this.image = image;
		this.urlMapping = urlMapping;
		this.domain = domain;
		this.locale = locale;
		this.affliateTag = affliateTag;
	}

	public String getEmailId() {
		return emailId;
	}
	
	public String getUrlMapping() {
		return urlMapping;
	}
	
	public String getDomain() {
		return domain;
	}
	
	public String getLocale() {
		return locale;
	}
	
	public String getAffliateTag() {
		return affliateTag;
	}
	
	public String getName() {
		return name;
	}
	
	public String getImage() {
		return image;
	}
	
	public static AffiliateType getByEmailId(String emailId) {
		AffiliateType[] values = AffiliateType.values();
		for (AffiliateType affiliateType : values) {
			if (affiliateType.getEmailId().equals(emailId)) {
				return affiliateType;
			}
		}
		return null;
	}
	
}
