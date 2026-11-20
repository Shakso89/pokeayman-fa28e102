package com.pokeayman.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(GoogleAuth.class);
        super.onCreate(savedInstanceState);
        handleIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        if (intent == null) return;
        Uri data = intent.getData();
        if (data != null) {
            String scheme = data.getScheme();
            String host = data.getHost();
            
            // Handle com.pokeayman.app:// or deep link back to app
            if ("com.pokeayman.app".equals(scheme)) {
                // e.g. com.pokeayman.app://classes#access_token=...
                String path = data.getPath() != null ? data.getPath() : "";
                String fragment = data.getFragment() != null ? "#" + data.getFragment() : "";
                String query = data.getQuery() != null ? "?" + data.getQuery() : "";
                
                String targetUrl = "https://pokeayman.pokeayman.workers.dev" + (path.startsWith("/") ? path : "/" + path) + query + fragment;
                if (getBridge() != null && getBridge().getWebView() != null) {
                    getBridge().getWebView().post(() -> getBridge().getWebView().loadUrl(targetUrl));
                }
            }
        }
    }
}

