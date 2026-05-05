<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('tracksy:send-reminders')->dailyAt('08:00');
