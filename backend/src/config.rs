use std::error::Error;
use std::fmt;
use std::path::PathBuf;

use serde::Deserialize;

#[derive(Clone, Debug, Deserialize)]
pub struct Config {
    pub database_url: String,
    #[serde(default = "default_port")]
    pub port: u16,
    #[serde(default = "default_static_dir")]
    pub static_dir: PathBuf,
}

impl Config {
    pub fn load() -> Result<Self, ConfigError> {
        // Missing .env is acceptable; explicit environment variables still work.
        let _ = dotenvy::dotenv();

        envy::from_env::<Self>().map_err(ConfigError::from)
    }
}

fn default_port() -> u16 {
    8080
}

fn default_static_dir() -> PathBuf {
    PathBuf::from("frontend/dist")
}

#[derive(Debug)]
pub enum ConfigError {
    InvalidEnvironment(envy::Error),
}

impl fmt::Display for ConfigError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidEnvironment(error) => write!(f, "failed to load configuration: {error}"),
        }
    }
}

impl Error for ConfigError {
    fn source(&self) -> Option<&(dyn Error + 'static)> {
        match self {
            Self::InvalidEnvironment(error) => Some(error),
        }
    }
}

impl From<envy::Error> for ConfigError {
    fn from(error: envy::Error) -> Self {
        Self::InvalidEnvironment(error)
    }
}
