package core.controller;

import java.util.Properties;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import core.model.OneLink;
import core.model.User;

public class MailHelper {

    private static String USER_NAME = "one.click.share.link"; 
    private static String PASSWORD = "*****";
    private static String EXTENSION_URL = "https://chrome.google.com/webstore/detail/1-click-share-link/ahphcmppigmmngfoehcncdfpafapijmj";
    private static String EXTENSION_NAME = "1-Click Share Link";

    public static void sendFromGMail(OneLink link, User fromUser, User toUser) {
    	String fromEmailId = fromUser.getEmailId();
    	String fromUserName = fromUser.getUserInfo().getName();
      
    	sendUsingGmail(link, fromUserName, fromEmailId);
    }

	private static void sendUsingGmail(OneLink link, String fromUserName, String fromEmailId) {
		String toEmailId = link.getEmailId();
    	Properties props = System.getProperties();
        String host = "smtp.gmail.com";
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", host);
        props.put("mail.smtp.user", USER_NAME);
        props.put("mail.smtp.password", PASSWORD);
        props.put("mail.smtp.port", "587");
        props.put("mail.smtp.auth", "true");
        
		String subject = String.format("%s has shared you a link %s", fromUserName, link.getTitle());

        Session session = Session.getDefaultInstance(props);
        MimeMessage message = new MimeMessage(session);

        try {
			message.setFrom(new InternetAddress(USER_NAME));
			InternetAddress toAddress = new InternetAddress(toEmailId);
			InternetAddress fromAddress = new InternetAddress(fromEmailId);

            message.addRecipient(Message.RecipientType.TO, toAddress);
            message.addRecipient(Message.RecipientType.CC, fromAddress);

            message.setSubject(subject);
            message.setContent(getBody(link, fromUserName), "text/html; charset=utf-8");
            Transport transport = session.getTransport("smtp");
            transport.connect(host, USER_NAME, PASSWORD);
            transport.sendMessage(message, message.getAllRecipients());
            transport.close();
        }
        catch (AddressException ae) {
            ae.printStackTrace();
        }
        catch (MessagingException me) {
            me.printStackTrace();
        }
	}
    
    private static String getBody(OneLink link, String fromUserName) {
    	StringBuilder builder = new StringBuilder();
    	builder.append("<html>");
    	builder.append(String.format("<p>I have shared a link using %s.</p>", EXTENSION_NAME));
    	
    	String linkHref = String.format("<p><a href=\"%s\">%s</a></p>", link.getUrl(), link.getTitle());
    	builder.append(linkHref);
    	String extHref = String.format("<p>You can visit the extension <a href=\"%s\">%s</a> from Chrome Store.</p>", EXTENSION_URL, EXTENSION_NAME);
    	builder.append(extHref);
    	builder.append(String.format("<p>-%s</p>", fromUserName));
    	builder.append("</html>");
    	
    	return builder.toString();
    }
    
    
    public static void main(String[] args) {
		OneLink link = new OneLink("Google", "https://www.google.co.in", "deviprasad742@gmail.com");
		sendUsingGmail(link, "Prasad", "deviprasad546@gmail.com");
		String body = getBody(link, "Prasad");
		System.out.println(body);
	}
    
}
