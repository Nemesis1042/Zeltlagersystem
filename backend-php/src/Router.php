<?php
/**
 * API Router - Simple Routing für REST API
 */

class Router {
    private $routes = array();
    private $method;
    private $path;

    public function __construct() {
        $this->method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        if (!empty($_SERVER['PATH_INFO'])) {
            $this->path = $_SERVER['PATH_INFO'];
        } elseif (!empty($_SERVER['REQUEST_URI'])) {
            $this->path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
            $this->path = str_replace('/backend-php/public', '', $this->path);
        } else {
            $this->path = '/';
        }

        // Remove /api prefix for route matching
        $this->path = preg_replace('#^/api#', '', $this->path);
        if (empty($this->path)) {
            $this->path = '/';
        }
    }

    public function get($route, $callback) {
        $this->routes['GET'][$route] = $callback;
    }

    public function post($route, $callback) {
        $this->routes['POST'][$route] = $callback;
    }

    public function put($route, $callback) {
        $this->routes['PUT'][$route] = $callback;
    }

    public function patch($route, $callback) {
        $this->routes['PATCH'][$route] = $callback;
    }

    public function delete($route, $callback) {
        $this->routes['DELETE'][$route] = $callback;
    }

    public function dispatch() {
        // CORS Headers
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Content-Type: application/json');

        if ($this->method === 'OPTIONS') {
            http_response_code(200);
            exit;
        }

        $route = $this->findRoute();

        if ($route === null) {
            $this->notFound();
            return;
        }

        call_user_func($route['callback'], $route['params']);
    }

    private function findRoute() {
        if (!isset($this->routes[$this->method])) {
            return null;
        }

        foreach ($this->routes[$this->method] as $route => $callback) {
            $pattern = $this->routeToRegex($route);
            if (preg_match($pattern, $this->path, $matches)) {
                $params = array();
                foreach ($matches as $key => $value) {
                    if (!is_numeric($key)) {
                        $params[$key] = $value;
                    }
                }
                return array('callback' => $callback, 'params' => $params);
            }
        }

        return null;
    }

    private function routeToRegex($route) {
        $route = preg_replace('/{(\w+)}/', '(?P<$1>[^/]+)', $route);
        return '#^' . $route . '$#';
    }

    private function notFound() {
        http_response_code(404);
        echo json_encode(array(
            'error' => 'Route not found',
            'path' => $this->path,
            'method' => $this->method
        ));
    }
}
