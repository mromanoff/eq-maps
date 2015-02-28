<fieldset class="fieldset-row">
  <center>
    <p>THIS AMOUNT WILL BE CHARGED</p>
    <h3>
      <span id="remBal"></span>
    </h3>
    <hr/>
    <p>DO YOU HAVE A NEW CARD</p>
    <button class="white button large submit" type="reset">EMPTY ALL FIELDS</button>
    <hr/>
  </center>
</fieldset>

<div class="form-error error"></div>

<label>
  <center>All fields are required unless stated.</center>
</label>

<fieldset class="fieldset-row">
  <div data-fields="nameOnCard"></div>
</fieldset>

<fieldset class="fieldset-row address-fields">
  <div data-fields="address1,address2"></div>
</fieldset>

<fieldset class="fieldset-row location-fields">
  <div data-fields="city,state,zipCode,country"></div>
</fieldset>

<fieldset class="fieldset-row creditcard-fields">
  <div data-fields="creditCardNumber,expirationDate,securityCode"></div>
</fieldset>

<fieldset class="fieldset-row form-section membership-agreement-fields">
  <h3 class="title">Membership Agreement</h3>
  <fieldset class="fieldset-row">
    <legend>EASY PAY</legend>
    <div data-fields="autopay"></div>
  </fieldset>

  <fieldset class="fieldset-row">
    <legend>TERMS & CONDITIONS</legend>
    <div data-fields="hasAgreedToTerms"></div>
  </fieldset>
</fieldset>
