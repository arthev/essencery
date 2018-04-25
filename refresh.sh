#!/bin/bash

rails db:drop RAILS_ENV=development db:create db:migrate db:schema:load db:seed
