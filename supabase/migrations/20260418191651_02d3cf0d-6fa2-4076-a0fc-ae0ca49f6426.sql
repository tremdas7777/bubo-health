UPDATE public.gateway_config 
SET utmify_api_token = 'HjRrO2dysD5929wvttkpbI8rCZVrf3NRiqpm', 
    updated_at = now() 
WHERE id = (SELECT id FROM public.gateway_config ORDER BY updated_at DESC LIMIT 1);