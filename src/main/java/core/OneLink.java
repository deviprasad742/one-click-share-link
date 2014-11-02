package core;

import org.springframework.data.annotation.Id;

public class OneLink {

	@Id
	private final String title;
	private final String link;

	public OneLink(String title, String link) {
		this.title = title;
		this.link = link;
	}

	@Override
	public String toString() {
		return "OneLink [title=" + title + ", link=" + link + "]";
	}

	public String getTitle() {
		return title;
	}

	public String getLink() {
		return link;
	}

}
