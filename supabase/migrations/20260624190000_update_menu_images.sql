-- Point existing menu_items rows at the local images in /public/images.
-- (The original seed used Lovable CDN URLs, which no longer resolve.)
update public.menu_items set image_url = '/images/epicfood3.png'    where name = 'Crispy Chicken Bites';
update public.menu_items set image_url = '/images/epicfood2.png'    where name = 'Garden Crisp Salad';
update public.menu_items set image_url = '/images/epicsamosas.png'  where name = 'Spring Rolls';
update public.menu_items set image_url = '/images/epicfood3.png'    where name = 'Epic Mixed Grill';
update public.menu_items set image_url = '/images/epicfood.png'     where name = 'Epic Big Breakfast';
update public.menu_items set image_url = '/images/epicfood2.png'    where name = 'Brown Plate Special';
update public.menu_items set image_url = '/images/epicfood3.png'    where name = 'Sadza & Beef Stew';
update public.menu_items set image_url = '/images/epiccakeslice.png' where name = 'Decadent Brownie';
update public.menu_items set image_url = '/images/epiccakes.png'    where name = 'Classic Cheesecake';
update public.menu_items set image_url = '/images/epicfood2.png'    where name = 'Signature Cappuccino';
update public.menu_items set image_url = '/images/epicmilkshake.png' where name = 'Berry Milkshake';
update public.menu_items set image_url = '/images/epicdrinks.png'   where name = 'Sunset Mocktail';
