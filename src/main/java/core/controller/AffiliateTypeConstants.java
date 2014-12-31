package core.controller;

import java.util.ArrayList;
import java.util.List;

public class AffiliateTypeConstants {
	
	public static final String AMAZON_IN_URL_MAPPING = "amazon-india";
	public static final String FLIPKART_URL_MAPPING = "flipkart";
	public static final String PREFIX_PARAM_AND = "&";

	public static final String AMAZON_IN_IMAGE = "http://www.google-search.co.in/images/domain/homepage/amazon.png";
	public static final String FLIPKART_IMAGE = "http://www.google-search.co.in/images/domain/homepage/flipkart.png";
	
	private static List<String> blackList; 
	public static List<String> getBlackList() {
		if (blackList == null) {
			blackList = new ArrayList<String>();
			blackList.add("affid=buyhatkegm");
			blackList.add("tag=buyhatke-21");
		}
		return blackList;
	}

}
