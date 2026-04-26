UPDATE public.pixel_config
SET config = jsonb_set(
  config,
  '{facebookPixels}',
  '[{"id":"fb-3150604831816989","pixelId":"3150604831816989","accessToken":"EAAT9vRp5JWABRVUUVaYPiQF0j7Y8iZA7ycXMbjATlIMNPgkFCWcta5DSIzUVRVAx6d6xRfYCa1kMUbLsMLtWcBa49HeDKZAMqOcLQ5E3AHJqwfetsptIIKdZBiVAfK7oF03cjcZAUOk19mmpXXO65ZAR8eQSzFCIdMZB1BCalOHmzog3UUypvcMaGHfppVMQZDZD"}]'::jsonb
);