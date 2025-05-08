#[derive(Debug)]
pub enum WifiManagerError {
    CommandExecutionFailure,
    OutputParsingError,
}

#[derive(Debug)]
pub enum WifiConnectionError {
    NoPasswordProvided,
    WrongPassword,
    NoSuchNetwork,
    UnknownError,
    AskingError,
}

#[derive(Debug)]
pub enum StatsError {
    InvalidInterfaceName,
    InterfaceValidationError,
    UnknownError,
    NoAppInContext,
}
