# Stopover-chat

![enter image description here](https://www.antoineparat.com/img/stopover.png)

This is a **MEVN** app using **Socket.IO** for live chat and **Stripe API** to handle payment.

# Features 

- Full Stack application

  > **Vue.js** on client side / **Node.js** on server side.
  
- Instant messaging

  > Using [Socket.IO](https://socket.io/)
  
- User can create and/or join public or private room (protected by password)

- Non premium user can't create more than one chat room per 12h

  > **Client IP** is stored and checked.
  
- Chat rooms are auto-destroyed 12 hours after being created.

  > This is a "fly-away" chat. Countdown is displayed in the chat room.
  
- Room's name and username verification

  > Two chat rooms can't have the same name and two user can't have the same username inside the some room.
 
 - A premium user can create an illimited number of chat rooms
 
   > To become premium you have to subscribe a monthly billing.
  
 - [Stripe API](https://stripe.com/fr) is used to handle payment.
 
   > With a demo card number for the needs on this project.
   
  - Stripe **webhooks**

    > - Update a customer’s membership record in my database when a subscription payment succeeds.  
    > - Send a subscription or a cancelation email.
    
- Sending emails

  > Welcome emails, password reset flow and cancellation emails are sent with SendGrid

- Special admin authorizations

  > User who creates a chat room is the admin of this one.  
  As an admin he gets two powers : to block an user or to ban an user.  
  A blocked user will be able to read messages but not to post its.  
  A banned user is pushed out of the room and can't connect again unless to be unbaned. 
  
 - IP checking
 
   > In addition to preventing non premium user from creating more than one room,
  banned user's IP is blacklisted. (Only the username is blacklisted in this demo version).
  
- Setting status

  > Users can set status "online", "busy" or "absent"
  
- Downloading chat history 

  > Users can dowload their chat history in pdf. History of each user begins when he joins the room.

- Authentification

  > Sign up / Sign in / Sign out with encrypted password stored in database.
  
- Cookies and JSON Web Tokens

  > Are used to manage Authorization  
  
- Database Schemas and Document Relationships

  > Two models are used and managed with Mongoose : Rooms and Users.

- REST API

  > RESTful API with Node and Express.
  
- Server Deployment

  > Deployed on Heroku.
  
