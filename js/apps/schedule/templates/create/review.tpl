<section class="class-module no-padding-bottom">
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
    <a href="#" class="underlined-small-link black add-message">attach a message</a>

    <div class="add-message-container hidden">
        <textarea maxlength="300" style="resize: none;"></textarea>

        <div class="char-counter">300</div>
    </div>
</section>

<section class="class-module no-padding-bottom">
    <nav class="buttons">
        <a href="#" class="button black small box inline half-button schedule">Schedule Session</a>
    </nav>
    <a href="/personal-training/schedule" class="underlined-small-link black">cancel</a>
</section>