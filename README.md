# Why this app?

Google recaptcha is commonly used in many contact forms. It is a good trade-off between safety, UX and ease to deploy. This stack comes as a ready-to-deploy AWS Serverless Application Model (SAM) package that can be used with virtually any front-end. 

Whereas it is generally a good idea to check the captcha on the client side so the user can be warned if something didn't go well, it is essential to also validate it on the back-end side so any user or bot trying to bypass the captcha on the webpage will be rejected unless the captcha is confirmed as properly validated by Google recaptcha API. 

# What's in there?

This SAM stack includes a REST API, a Node.js lambda function, as well as all the necessary IAM roles and permissions. The REST API can be integrated with the front-end serving the captcha. There are examples available for a HTML/CSS/JavaScript static website. I personally use it for my own resume webpage. 

The function will use SES to send email to the contact form owner, using the address specified when deploying the package.

The costs are extremely low because everything runs serverless and on-demand. 

# What does it require? 

Not much, as everything has been automated. Just make sure the following are available:

1. Google recaptcha API. There are many tutorials explaining how to request your own API with Google. It is free and you will receive two parameters that are specific to your recaptcha: the site key (for the client side) and the secret key (to verify on the server side). 

2. SES. Just make sure that the email address or domain you are sending emails to is verified as a valid recipient in the region's SES you are deploying the stack to. 

3. AWS SAM CLI installed and configured, or you can run the commands in Cloud9 IDE where everything is already preloaded. 

![Google API keys](/images/googleapikeys.png)

# How to deploy?

1. First clone this repository. 

```bash
sam init --location gh:lautmat/aws-contactformcaptcha-api
```

2. Then build the function.  

```bash
sam build
```

2. Now you are ready to deploy.

```bash
sam deploy --guided
```

3. Customize your stack deployment. 

![Stack Deployment](/images/sam-deploy.png)


4. At the end of the deployment, the command will give you the name of the API that you can star using on your website code. 

![Stack Deployment](/images/API-name-output.png)


# Example of integration for a static website

This example is based on a static HTML/CSS website hosted on S3. 

This is how the Contact Form with recaptcha looks like: 

![Contact Form](/images/contact-form.png)

It is rendered using the following form in the html page.
```html
      <div class="col-md-8">
        <div class="cv-item">
          <form id="contact-form" class="contact-form form-horizontal" action="?" method="post">
            <fieldset>
              <div class="form-group">
                <div class="col-lg-12">
                  <input type="text" class="form-control" id="name" name="name" placeholder="name">
                </div>
              </div>
              <div class="form-group">
                <div class="col-lg-12">
                  <input type="text" class="form-control" id="email" name="email" placeholder="email">
                </div>
              </div>
              <div class="form-group">
                <div class="col-lg-12">
                  <input type="text" class="form-control" id="subject" name="subject" placeholder="subject">
                </div>
              </div>
              <div class="form-group">
                <div class="col-lg-12">
                  <textarea class="form-control" rows="3" id="message" name="message" placeholder="message"></textarea>
                </div>
              </div>
              <div class="form-group">
                <div class="col-lg-12">
                <div class="g-recaptcha" data-sitekey="6LdfnsUZAAAAAHpZ325HLMIHdWoXiG6DERthI5rD" id="recaptcha"></div>
                </div>
              </div>				
              <div class="form-group">
				<div class="col-lg-12">
                  <button type="submit" class="btn btn-three" onClick="submitToAPI(event)">Submit</button>
                </div>
              </div>
            </fieldset>
			<script src="https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit" async defer></script>
          </form>
        </div>
      </div>
```
The page also needs the following javascript statement to render the captcha:
```html
<script type="text/javascript">
	var onloadCallback  = function () {
		grecaptcha.render('recaptcha', {
			'sitekey' : '6LdfnsUZAAAAAHpZ325HLMIHdWoXiG6DERthI5rD'
		});
	};
</script>
```
The `submitToAPI()` function has been written in the associated `vendor.js` file: 
```javascript
/**
 * Send parameters to the contact form API after verifying the captcha is valid
 */
function submitToAPI(e) {
       e.preventDefault();
       var rescaptcha = grecaptcha.getResponse();
			if (rescaptcha == false) {
                alert ("Captcha not valid");
                return;
			}			
            if ($("#name").val()=="") {
                alert ("Please enter your name");
                return;
			}
            if ($("#email").val()=="") {
                alert ("Please enter your email address");
                return;
            }
            if ($("#message").val()=="") {
                alert ("Please enter your message");
                return;
            }
            var reeamil = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,6})?$/;
            if (!reeamil.test($("#email").val())) {
                alert ("Please enter valid email address");
                return;
            }
       var name = $("#name").val();
       var email = $("#email").val();
       var subject = $("#subject").val();
       var desc = $("#message").val();
       var data = {
          name : name,
          email : email,
          subject : subject,
          desc : desc,
		  rescaptcha : rescaptcha
        };

       $.ajax({
         type: "POST",
         url : "https://XXXX.execute-api.ap-southeast-1.amazonaws.com/stage1/contactform",
		 dataType: "json",
         crossDomain: "true",
         contentType: "application/json; charset=utf-8",
         data: JSON.stringify(data),
         
         success: function () {
           // clear form and show a success message
           alert("Thanks! Your message has been sent to Laurent.");
           document.getElementById("contact-form").reset();
       location.reload();
         },
         error: function () {
           // show an error message
           alert("There was an error. Message not sent.");
         }});
}
```
Replace the `url` with your own newly created API's URL.

`url : "https://XXXX.execute-api.ap-southeast-1.amazonaws.com/stage1/contactform",`

# What's next?

In the next releases we may replace SES by SNS so we can trigger more channels than just the email (for example a Telegram notification). 
