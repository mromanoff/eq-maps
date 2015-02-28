<div class="info-block narrow">
  <div>

    <h6>
      <%= name %>
    </h6>

    <p>

      <%= address1 %><br />
      <%= city %>, <%= state %> <%= zipCode %><br />

      <% if( mobilePhone ) { %>
                <%= mobilePhone %><br />
      <% } else if(homePhone) { %>
                <%= homePhone %><br />
      <% } else if(workPhone) { %>
                <%= workPhone %><br />
      <% } %>

      born on <%= birthDate %><br />

      <a href="#edit">Edit</a>

    </p>

  </div>
</div>
<div class="info-block narrow">
  <div>
    <p>
        <%= email %><br />
        <a href="#username/edit">Change username/email</a><br />
        <a href="#password/edit">Change password</a>
    </p>
  </div>
</div>
 <p class="center-children"><span class="is-error hidden"></span></p>
<div class="info-block">
 
  <p>
    <% var fbId=userProfileJson.FacebookId;
       if(fbId !== null && fbId !=='') { %>
     FACEBOOK CONNECTED AS    <a href='http://www.facebook.com/<%=fbId%>' data-bypass="true" target='_blank' class="facebook-id"><%= name %></a>
     
      <% if(userProfileJson.IsFacebookLinked!==null && userProfileJson.IsFacebookLinked===true) {%>
      <div class="info-block">
      <a href='#' class='box white button small deLink'>Disconnect with facebook</a>
      </div>
      
      <%} }else{ %>
        
    <a href='/login/connect?firstName=<%=userProfileJson.FirstName %>&lastName=<%=userProfileJson.LastName %>&ReturnUrl=/account' data-bypass="true" class='box white button small'>connect with facebook</a>
    <% }%>
  </p>
</div>
<div class="info-block">
  <div>
    <h6>HAVE QUESTIONS ABOUT YOUR CURRENT BALANCE?</h6>
    <p>
      Please contact your club manager or send us an email at <a href="mailto:ms@equinox.com" data-bypass="true">ms@equinox.com</a>
    </p>
  </div>
</div>
<div class="clearfix"></div>