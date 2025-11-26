pipeline {
  agent any

  environment {
    IMAGE_NAME = "demoapp:${env.BUILD_NUMBER}"

    // Default env
    PORT = "3000"
    MONGO_URL = "mongodb://localhost:27017/chatapi"
  }

  stages {

    stage('Checkout Code') {
      steps { checkout scm }
    }

    stage('Build Docker Image') {
      steps {
        sh """
        echo "Building image..."
        docker build -t ${IMAGE_NAME} .
        """
      }
    }

    stage('OWASP Dependency-Check Scan') {
      steps {
        withCredentials([string(credentialsId: 'NVD_API_KEY', variable: 'NVDKEY')]) {
          sh """
            mkdir -p dc-report

            docker run --rm \
              -v $(pwd):/src \
              -v $(pwd)/dc-report:/report \
              owasp/dependency-check \
              --scan /src \
              --format ALL \
              --nvdApiKey $NVDKEY \
              --out /report
          """
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'dc-report/*'
        }
      }
    }

    stage('Fail on High Vulnerabilities') {
      steps {
        script {
          echo "Scanning XML report..."
          def xml = readFile("dc-report/dependency-check-report.xml")
          if (xml.contains("<severity>High</severity>")) {
            error("High severity vulnerabilities detected — Deployment blocked")
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
        -e PORT=3000 \
        -e JWT_SECRET="$JWT_SECRET" \
        -e ACCESS_TOKEN_SECRET="$ACCESS_TOKEN_SECRET" \
        -e REFRESH_TOKEN_SECRET="$REFRESH_TOKEN_SECRET" \
        -e MONGO_URL="$MONGO_URL" \
        demoapp:${BUILD_NUMBER}
    '''
  }
}

  }

  post {
    success { echo "Pipeline completed successfully!" }
    always { sh 'docker image prune -f || true' }
  }
}
