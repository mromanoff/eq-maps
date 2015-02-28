<form class="large white">
    <fieldset>
        <div>
            <span class="dropdown block white">
                <span class="option"><%= defaultTrainer %></span>
                <select id="select-trainer" class="select-trainer" name="trainer">
                    <% _.each(trainers, function(item){ %>
                        <option value="<%= item.trainerId %>"><%= item.trainerFirstName %> <%= item.trainerLastName %></option>
                    <% }); %>
                </select>
            </span>
        </div>
        <div>
            <span class="dropdown block white">
                <span class="option"><%= defaultDuration %></span>
                <select id="select-duration" class="select-duration" name="duration">
                    <% _.each(durations, function(item){ %>
                    <option value="<%= item.sessionTypeId %>"><%= item.duration %></option>
                    <% }); %>
                </select>
            </span>
        </div>
    </fieldset>
</form>
