const target=new URL(document.querySelector('link[rel="canonical"]').href);
location.replace(target.pathname+location.search+location.hash);
