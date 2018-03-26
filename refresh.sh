#!/bin/bash

rails db:drop RAILS_ENV=development db:create db:schema:load db:seed
