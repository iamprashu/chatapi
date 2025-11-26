pipeline {
  agent any

  environment {
    IMAGE_NAME = "demoapp:${env.BUILD_NUMBER}"
    DEP_REPORT_DIR = "dc-report"
    DEP_REPORT_HTML = "dependency-check-report.html"
    DEP_REPORT_XML = "dependency-check-report.xml"

    // Load secrets from Jenkins credentials – NOT typed in here
    PORT               = credentials('PORT')
    JWT_SECRET         = credentials('JWT_SECRET')
    ACCESS_TOKEN_SECRET = credentials('ACCESS_TOKEN_SECRET')
    REFRESH_TOKEN_SECRET = credentials('REFRESH_TOKEN_SECRET')
    MONGO_URL          = credentials('MONGO_URL')
  }

  stages {

    stage('Checkout Code') {
      steps { checkout scm }
    }

    stage('Build Docker Image') {
      steps {
        sh '''
          echo "Building Docker image..."
          docker build -t ${IMAGE_NAME} .
        '''
      }
    }

    stage('OWASP Dependency-Check Scan') {
      steps {
        withCredentials([string(credentialsId: 'NVD_API_KEY', variable: 'NVDKEY')]) {
          sh '''
            mkdir -p dc-report

            docker run --rm \
              -v $(pwd):/src \
              -v $(pwd)/dc-report:/report \
              owasp/dependency-check \
              --scan /src \
              --format ALL \
              --nvdApiKey $NVDKEY \
              --out /report
          '''
        }
      }
      post {
        always {
          archiveArtifacts artifacts: "dc-report/*"
        }
      }
    }

    stage('Fail on High Vulnerabilities') {
      steps {
        script {
          def xml = readFile("dc-report/${DEP_REPORT_XML}")
          echo "Scanning XML report for HIGH severity vulnerabilities..."

          if (xml.contains("<severity>High</severity>")) {
            error("High severity vulnerabilities found — deployment blocked.")
          } else {
            echo "No High vulnerabilities found."
          }
        }
      }
    }

    stage('Deploy Application') {
      steps {
        sh '''
          echo "Deploying app..."

          docker rm -f deployed-demoapp || true

          docker run -d --name deployed-demoapp \
            -p 3000:3000 \
            -e PORT="${PORT}" \
            -e JWT_SECRET="${JWT_SECRET}" \
            -e ACCESS_TOKEN_SECRET="${ACCESS_TOKEN_SECRET}" \
            -e REFRESH_TOKEN_SECRET="${REFRESH_TOKEN_SECRET}" \
            -e MONGO_URL="${MONGO_URL}" \
            ${IMAGE_NAME}
        '''
      }
    }

  }

  post {
    always {
      sh 'docker image prune -f || true'
    }
    success {
      echo "Pipeline completed successfully!"
    }
  }
}
