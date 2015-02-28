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
    <p>your calendar is updated and your trainer has been notified</p>

    <div class="export">
        <a target="_blank" class="export" href="<%= APIEndpoint %>/ME/CALENDAR/EVENTS/<%= id %>/EXPORT/ICS?exportType=AppointmentInstance">
            <span class="icon-export"></span>Export to calendar
        </a>
    </div>

    <nav class="buttons" data-id="<%= id %>">
        <a href="#" class="underlined-small-link black cancel">cancel
            session</a>
    </nav>
</section>
