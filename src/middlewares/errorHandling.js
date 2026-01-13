export function notFoundError (req, res, next)
{
    const error = new Error(`Not found: ${req.method} ${req.originalUrl}`);

    error.name = error.name || "NotFoundError";
    error.status = error.status || 404;

    next(error);
}

export function centralizedError (err, req, res, next)
{
     console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        stack: err.stack,
    });
}