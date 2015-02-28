<section class="class-module no-padding-bottom">
    <div class="original">
        <h4>original:</h4>
        <ul class="class-detail">
            <li class="medium-font"><%= originalAppointmentDate %></li>
            <li class="medium-font"><%= originalAppointmentTime %></li>
        </ul>
    </div>

    <div>
        <h4>new:</h4>
        <h3 class="tier"><%= trainerTier %></h3>
        <div>Personal Training</div>
        <ul class="class-detail">
            <li class="big-font"><%= appointmentDate %></li>
            <li class="big-font"><%= appointmentTime %></li>
            <li class="medium-font">w/<%= trainerFirstName %></li>
            <li class="medium-font"><%= facilityName %></li>
        </ul>
    </div>
</section>

<section class="class-module no-padding-bottom">
    <a href="#" class="underlined-small-link black add-message">attach a message</a>

    <div class="add-message-container hidden">
        <textarea maxlength="300" style="resize: none;"></textarea>

        <div class="char-counter">300</div>
    </div>
</section>

<section class="class-module no-padding-bottom">
    <nav class="buttons">
        <a href="" class="button white small half-button box update">Edit Session</a>
        <a href="" class="button black small half-button box schedule">Schedule Session</a>
    </nav>
    <a href="/personal-training/schedule" class="underlined-small-link black">Back</a>
</section>

