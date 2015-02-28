<section class="class-module no-padding-bottom">
    <h1 class="title">Are you Sure?</h1>
    <p><% warningMessage && print(warningMessage); %></p>

    <h3 class="tier"><%= trainerTier %></h3>

    <ul class="class-detail">
        <li class="big-font"><%= appointmentDate %></li>
        <li class="big-font"><%= appointmentTime %></li>
        <li class="medium-font">Personal Training</li>
        <li class="medium-font">w/<%= trainerFirstName %></li>
        <li class="medium-font"><%= facilityName %></li>
    </ul>
</section>

<section class="class-module no-padding-bottom">
    <% _.each(notes, function(note){ %>
    <p><%= note %></p>
    <% }); %>


    <a href="#" class="underlined-small-link black add-message">attach a message</a>

    <div class="add-message-container hidden">
        <textarea maxlength="300" style="resize: none;"></textarea>

        <div class="char-counter">300</div>
    </div>
</section>

<section class="class-module no-padding-bottom">
    <nav class="buttons">
        <% cancelAll && print('<a href="#" class="button white small half-button box inline cancel">Cancel all Sessions</a>')%>
        <% !cancelAll && print('<a href="#" class="button black small half-button box inline cancel">Cancel this Session</a>')%>
    </nav>
    <p>
        <a href="/personal-training" class="underlined-small-link black">Back</a>
    </p>
</section>
