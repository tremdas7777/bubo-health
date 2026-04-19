UPDATE public.products
SET 
  name = 'LED Ceiling Fan 2-in-1 with Remote Control',
  name_translations = jsonb_build_object(
    'en', 'LED Ceiling Fan 2-in-1 with Remote Control',
    'es', 'Ventilador de Techo LED 2 en 1 con Control Remoto',
    'pt', 'Ventilador de Teto LED 2 em 1 com Controle Remoto',
    'fr', 'Ventilateur de Plafond LED 2-en-1 avec Télécommande'
  ),
  description = 'Multifunctional 2-in-1 LED ceiling fan and lamp with remote control. Retractable blades, 3 light colors, multiple speeds and silent motor. Modern design that transforms any room.',
  description_translations = jsonb_build_object(
    'en', 'Multifunctional 2-in-1 LED ceiling fan and lamp with remote control. Retractable blades, 3 light colors, multiple speeds and silent motor. Modern design that transforms any room.',
    'es', 'Ventilador de techo y lámpara LED 2 en 1 multifuncional con control remoto. Aspas retráctiles, 3 colores de luz, varias velocidades y motor silencioso. Diseño moderno que transforma cualquier ambiente.',
    'pt', 'Ventilador de teto e luminária LED 2 em 1 multifuncional com controle remoto. Pás retráteis, 3 cores de luz, várias velocidades e motor silencioso. Design moderno que transforma qualquer ambiente.',
    'fr', 'Ventilateur de plafond et lampe LED 2-en-1 multifonction avec télécommande. Pales rétractables, 3 couleurs de lumière, plusieurs vitesses et moteur silencieux. Design moderne qui transforme toute pièce.'
  )
WHERE slug = 'ventilador-teto-led-2em1';