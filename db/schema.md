| table_name        |
| ----------------- |
| active_users      |
| conversation_logs |
| processed_videos  |
| subscriptions     |
| system_settings   |
| system_stats      |
| users             |
| youtube_channels  |

| column_name                 | data_type                | is_nullable | column_default                |
| --------------------------- | ------------------------ | ----------- | ----------------------------- |
| instance_id                 | uuid                     | YES         | null                          |
| id                          | uuid                     | NO          | gen_random_uuid()             |
| phone_number                | character varying        | YES         | null                          |
| id                          | uuid                     | NO          | null                          |
| aud                         | character varying        | YES         | null                          |
| name                        | character varying        | YES         | null                          |
| subscription_status         | character varying        | YES         | 'inactive'::character varying |
| role                        | character varying        | YES         | null                          |
| email                       | character varying        | YES         | null                          |
| subscription_id             | character varying        | YES         | null                          |
| max_channels                | integer                  | YES         | 3                             |
| encrypted_password          | character varying        | YES         | null                          |
| email_confirmed_at          | timestamp with time zone | YES         | null                          |
| created_at                  | timestamp with time zone | YES         | now()                         |
| invited_at                  | timestamp with time zone | YES         | null                          |
| updated_at                  | timestamp with time zone | YES         | now()                         |
| email                       | character varying        | YES         | null                          |
| confirmation_token          | character varying        | YES         | null                          |
| confirmation_sent_at        | timestamp with time zone | YES         | null                          |
| recovery_token              | character varying        | YES         | null                          |
| recovery_sent_at            | timestamp with time zone | YES         | null                          |
| email_change_token_new      | character varying        | YES         | null                          |
| email_change                | character varying        | YES         | null                          |
| email_change_sent_at        | timestamp with time zone | YES         | null                          |
| last_sign_in_at             | timestamp with time zone | YES         | null                          |
| raw_app_meta_data           | jsonb                    | YES         | null                          |
| raw_user_meta_data          | jsonb                    | YES         | null                          |
| is_super_admin              | boolean                  | YES         | null                          |
| created_at                  | timestamp with time zone | YES         | null                          |
| updated_at                  | timestamp with time zone | YES         | null                          |
| phone                       | text                     | YES         | NULL::character varying       |
| phone_confirmed_at          | timestamp with time zone | YES         | null                          |
| phone_change                | text                     | YES         | ''::character varying         |
| phone_change_token          | character varying        | YES         | ''::character varying         |
| phone_change_sent_at        | timestamp with time zone | YES         | null                          |
| confirmed_at                | timestamp with time zone | YES         | null                          |
| email_change_token_current  | character varying        | YES         | ''::character varying         |
| email_change_confirm_status | smallint                 | YES         | 0                             |
| banned_until                | timestamp with time zone | YES         | null                          |
| reauthentication_token      | character varying        | YES         | ''::character varying         |
| reauthentication_sent_at    | timestamp with time zone | YES         | null                          |
| is_sso_user                 | boolean                  | NO          | false                         |
| deleted_at                  | timestamp with time zone | YES         | null                          |
| is_anonymous                | boolean                  | NO          | false                         |

| column_name         | data_type                | is_nullable | column_default    |
| ------------------- | ------------------------ | ----------- | ----------------- |
| id                  | uuid                     | NO          | gen_random_uuid() |
| user_id             | uuid                     | YES         | null              |
| channel_id          | character varying        | NO          | null              |
| channel_name        | character varying        | NO          | null              |
| channel_url         | character varying        | NO          | null              |
| channel_description | text                     | YES         | null              |
| subscriber_count    | integer                  | YES         | null              |
| video_count         | integer                  | YES         | null              |
| last_video_id       | character varying        | YES         | null              |
| last_check_at       | timestamp with time zone | YES         | now()             |
| is_active           | boolean                  | YES         | true              |
| created_at          | timestamp with time zone | YES         | now()             |
| updated_at          | timestamp with time zone | YES         | now()             |

| table_name       |
| ---------------- |
| processed_videos |
